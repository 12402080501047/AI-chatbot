import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// @ts-ignore
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return new NextResponse("File must be a PDF", { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer));

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return new NextResponse("Error parsing PDF", { status: 500 });
  }
}
