import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the protobuf definition
const PROTO_PATH = path.resolve(__dirname, '../../../protos/voice_integrity.proto');

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const audiosentry = protoDescriptor.audiosentry;

// Initialize the client
const grpcUrl = process.env.ENGINE_GRPC_URL || 'localhost:50051';
const client = new audiosentry.VoiceIntegrityService(
  grpcUrl,
  grpc.credentials.createInsecure()
);

export default client;
