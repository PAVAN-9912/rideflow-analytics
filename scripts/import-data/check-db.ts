import mongoose from "mongoose";

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "ride_sharing_db",
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