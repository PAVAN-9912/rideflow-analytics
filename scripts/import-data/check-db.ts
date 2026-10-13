import "dotenv/config";
import mongoose from "mongoose";

async function check() {
  const uri =
    process.env.MONGODB_URI ??
    "mongodb://127.0.0.1:27017";

  const dbName =
    process.env.MONGODB_DATABASE ??
    "ride_sharing_db";

  await mongoose.connect(uri, {
    dbName,
  });

  console.log("Host:", mongoose.connection.host);
  console.log("Port:", mongoose.connection.port);
  console.log("Database:", mongoose.connection.name);

  const count = await mongoose.connection
    .collection("trips")
    .countDocuments();

  console.log("Trips:", count);

  await mongoose.disconnect();
}

check().catch((error) => {
  console.error("Database check failed:", error);
  process.exit(1);
});