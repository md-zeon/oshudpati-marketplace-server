import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
  try {
    console.log("***** Admin Seeding Started....");
    const adminData = {
      name: process.env.ADMIN_NAME!,
      email: process.env.ADMIN_EMAIL!,
      role: UserRole.ADMIN,
      password: process.env.ADMIN_PASSWORD!,
    };

    console.log("***** Checking Admin Exist or not");
    // check user exist on db or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists!!");
    }

    const signUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "http://localhost:5000",
        },
        body: JSON.stringify(adminData),
      },
    );

    const signUpAdminData = await signUpAdmin.json();
    console.log("**** Admin Sign Up Response: ", signUpAdminData);

    if (signUpAdmin.ok) {
      console.log("**** Admin created");
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });

      console.log("**** Email verification status updated!");
    }
    console.log("******* SUCCESS ******");
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
