import dotenv from 'dotenv';
import { readFileSync } from "fs";
import sdk from "./1-initialize-sdk.js";

dotenv.config();

const bundleDrop = sdk.getBundleDropModule(
  process.env.DROP_MODULE_ADDRESS,
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Artesanito",
        description: "This NFT gives you access to the ArtesansDAO!",
        image: readFileSync("scripts/assets/artesanito.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()