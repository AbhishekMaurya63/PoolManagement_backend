import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig = (): MongooseModuleOptions => ({
  uri: process.env.MONGO_URI,
});
