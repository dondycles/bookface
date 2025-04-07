import Pusher from "pusher";

export const pusher = new Pusher({
  appId: "1970826",
  key: "2c0645534f42e5e07784",
  secret: "3135cdf2d083f10b907b",
  cluster: "ap1",
  useTLS: true,
});
