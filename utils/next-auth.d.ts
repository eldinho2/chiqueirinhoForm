import NextAuth from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    userID: string;
    username: string;
    email: string;
    name: string;
    image: string;
    banner: string;
    pasword: string;
    role: string;
    nick: string;
  }

  interface sesion {
    user: {
      userID: string;
      username: string;
      email: string;
      name: string;
      image: string;
      banner: string;
      pasword: string;
      role: string;
      nick: string;
    }
  }

  interface JWT {
    userID: string;
    username: string;
    email: string;
    name: string;
    image: string;
    banner: string;
    pasword: string;
    role: string;
    nick: string;
  }
}
