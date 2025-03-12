// app/api/events/route.js
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc'
      }
    });

    if (!events || events.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formattedEvents = await Promise.all(
      events.map(async (event) => {
        const victimCount = await prisma.victim.count({
          where: { eventID: event.eventID }
        });

        let lat = 0, lng = 0; // Default values
        
        if (event.location && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          try {
            console.log(`Fetching geolocation for: ${event.location}`);
            
            // Fetch lat/lng from Google Maps API
            const geocodeResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${
                encodeURIComponent(event.location)
              }&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
              { timeout: 5000 } // Add timeout to prevent hanging
            );
            
            if (!geocodeResponse.ok) {
              throw new Error(`Geocoding API error: ${geocodeResponse.status}`);
            }
            
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData.status === "OK" && geocodeData.results && geocodeData.results.length > 0) {
              lat = geocodeData.results[0].geometry.location.lat;
              lng = geocodeData.results[0].geometry.location.lng;
            } else {
              console.error(`Geocoding failed for ${event.location}:`, geocodeData.status);
            }
          } catch (geocodeError) {
            console.error(`Error geocoding location "${event.location}":`, geocodeError);
            // Continue with default coordinates
          }
        }

        return {
          eventID: event.eventID,
          date: event.date,
          description: event.description,
          location: event.location,
          victimCount: victimCount,
          lat,
          lng
        };
      })
    );

    return new Response(JSON.stringify(formattedEvents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch events.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body) {
      return new Response(JSON.stringify({ error: 'Request body is missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { date, description, location } = body;
    
    // Check if a similar event already exists
    const existingEvent = await prisma.event.findFirst({
      where: {
        AND: [
          description ? { description } : {},
          location ? { location } : {},
          date ? { date: new Date(date) } : {}
        ]
      }
    });

    if (existingEvent) {
      // Return the existing event with a 200 status code
      return new Response(JSON.stringify({
        message: 'An event with this information already exists. Using existing record.',
        eventID: existingEvent.eventID,
        event: existingEvent,
        isExisting: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Create new event with explicit error handling for concurrent requests
    let newEvent;
    try {
      newEvent = await prisma.event.create({
        data: {
          date: date ? new Date(date) : null,
          description: description || "",
          location: location || null,
        },
      });
    } catch (createError) {
      if (createError.code === 'P2002') {
        // If we hit a unique constraint error during creation,
        // it's likely due to a race condition. Try to fetch the record instead.
        console.log('Handling potential race condition during event creation');
        
        // Try to find a similar event that might have been created concurrently
        const conflictingEvent = await prisma.event.findFirst({
          where: {
            AND: [
              description ? { description } : {},
              location ? { location } : {},
              date ? { date: new Date(date) } : {}
            ]
          },
          orderBy: {
            eventID: 'desc'  // Get the most recently created one
          }
        });
        
        if (conflictingEvent) {
          return new Response(JSON.stringify({
            message: 'An event with this information was just created. Using existing record.',
            eventID: conflictingEvent.eventID,
            event: conflictingEvent,
            isExisting: true
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        // If we couldn't find a similar event, let's try to create one with explicit eventID
        // This is a fallback approach
        const maxEventIdRecord = await prisma.event.findFirst({
          orderBy: {
            eventID: 'desc'
          },
          select: {
            eventID: true
          }
        });
        
        const nextEventId = maxEventIdRecord ? maxEventIdRecord.eventID + 1 : 1;
        
        try {
          newEvent = await prisma.event.create({
            data: {
              eventID: nextEventId,
              date: date ? new Date(date) : null,
              description: description || "",
              location: location || null,
            },
          });
        } catch (secondCreateError) {
          console.error('Second attempt to create event failed:', secondCreateError);
          throw secondCreateError;
        }
      } else {
        throw createError; // Re-throw any other errors
      }
    }
    
    return new Response(JSON.stringify({
      message: 'Event created successfully',
      eventID: newEvent.eventID,
      event: newEvent,
      isExisting: false
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/events error:', error);
    
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({
        error: 'An event with this information already exists.',
        details: 'Please try again with different information.'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Failed to create event.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}