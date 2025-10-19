import mongoose from 'mongoose';
import { UserModel } from './server/db/models/index.js';

const mongoUri = process.env.MONGODB_URI;
await mongoose.connect(mongoUri);

const users = await UserModel.find().select('name accessCode role');
console.log('Usuários encontrados:', users.length);
users.forEach(user => {
  console.log(`- ${user.name} (${user.role}) - Código: ${user.accessCode}`);
});

process.exit(0);
