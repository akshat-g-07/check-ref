import { NextResponse } from "next/server";

import prisma from "@/lib/db";

import { updateCronResponse } from "@/app/actions/crons";

export async function GET() {
  try {
    const crons = await prisma.cron.findMany({
      where: {
        isArchived: false,
      },
    });

    const results = [];

    for (const cron of crons) {
      let attempts = 0;
      let responseData = null;
      let responseType = "fail";

      while (attempts < 5) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

          const requestOptions = {
            method: cron.method,
            signal: controller.signal,
          };

          if (cron.headers) {
            requestOptions.headers = cron.headers;
          }

          if (cron.body && cron.method !== "GET") {
            requestOptions.body = cron.body;
          }

          const response = await fetch(cron.url, requestOptions);
          clearTimeout(timeoutId);

          const responseText = await response.text();

          responseData = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            body: responseText,
          };

          responseType = response.ok ? "success" : "fail";
          break; // Success, exit retry loop
        } catch (error) {
          attempts++;
          responseData = {
            error: error.message,
            attempt: attempts,
          };

          if (attempts >= 5) {
            responseType = "fail";
            break;
          }
        }
      }

      // Update the cron with the response
      await updateCronResponse(cron.id, responseData, responseType);

      results.push({
        cronId: cron.id,
        cronName: cron.name,
        projectName: cron.projectName,
        url: cron.url,
        responseType,
        responseData,
        attempts: attempts,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} cron jobs`,
      results,
    });
  } catch (error) {
    console.error("Error running cron jobs:", error);
    return NextResponse.json(
      { error: "Failed to run cron jobs" },
      { status: 500 }
    );
  }
}
