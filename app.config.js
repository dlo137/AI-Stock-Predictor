module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      eas: {
        projectId: "c0dee8dc-6f20-457f-9c6e-a5d5854a5894"
      },
      MASSIV_API_KEY: process.env.MASSIV_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
      LOGODEV_API_KEY: process.env.LOGODEV_API_KEY,
    },
  };
};
