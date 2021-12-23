import dotenv from 'dotenv';
import sdk from "./1-initialize-sdk.js";

dotenv.config()

const app = sdk.getAppModule(process.env.APP_ADDRESS);

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "ArtesansDAO Governance Token",
      symbol: "ARTESANITO",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address,
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();