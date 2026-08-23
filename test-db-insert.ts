import { db } from './src/db';
import { registrations, participants } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function run() {
  const pId = randomUUID();
  const rId = randomUUID();
  
  await db.insert(participants).values({
    id: pId,
    fullName: 'Test Participant',
    email: `participant_${randomUUID()}@example.com`,
    whatsapp: `+628000${randomUUID().substring(0, 8)}`,
    cityRegency: 'Jakarta'
  });

  await db.insert(registrations).values({
    id: rId,
    participantId: pId,
    registrationId: `TEST-${randomUUID().substring(0, 6).toUpperCase()}`,
    status: 'RECEIVED'
  });

  const [registrationData] = await db
    .select()
    .from(registrations)
    .innerJoin(participants, eq(registrations.participantId, participants.id))
    .where(eq(registrations.id, rId))
    .limit(1);

  console.log("Registration Data:", registrationData);
  process.exit(0);
}

run().catch(console.error);
