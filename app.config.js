module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      MASSIV_API_KEY: process.env.MASSIV_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
      LOGODEV_API_KEY: process.env.LOGODEV_API_KEY,
    },
  };
};
