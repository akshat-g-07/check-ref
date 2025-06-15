import { NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Extract the ref parameter from the URL
    const { searchParams } = new URL(request.url);
    const refVal = searchParams.get("ref");

    // Check if ref parameter is provided
    if (!refVal) {
      return NextResponse.json(
        { success: false, message: "ref parameter is required" },
        { status: 400 }
      );
    }

    // Find the ref with matching val
    const existingRef = await prisma.ref.findFirst({
      where: {
        val: refVal,
      },
    });

    if (existingRef) {
      // If ref found, add current date to visitedAt array
      await prisma.ref.update({
        where: {
          id: existingRef.id,
        },
        data: {
          visitedAt: {
            push: new Date(),
          },
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // If ref not found
      return NextResponse.json({ success: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking ref:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
