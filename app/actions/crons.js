"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/db";

export async function getCrons() {
  try {
    const crons = await prisma.cron.findMany({
      include: {
        project: true,
      },
      orderBy: [{ isArchived: "asc" }, { createdAt: "desc" }],
    });
    return crons;
  } catch (error) {
    console.error("Error fetching crons:", error);
    return [];
  }
}

export async function createCron(formData) {
  try {
    const name = formData.get("name");
    const projectName = formData.get("projectName");
    const url = formData.get("url");
    const method = formData.get("method") || "GET";
    const headers = formData.get("headers");
    const body = formData.get("body");
    const comments = formData.get("comments");

    if (!name || !projectName || !url) {
      return { error: "Name, project, and URL are required" };
    }

    let parsedHeaders = null;
    if (headers && headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        return { error: "Headers must be valid JSON" };
      }
    }

    const cron = await prisma.cron.create({
      data: {
        name,
        projectName,
        url,
        method,
        headers: parsedHeaders,
        body: body || null,
        comments: comments || null,
      },
    });

    revalidatePath("/dashboard/crons");
    return { success: true, cron };
  } catch (error) {
    console.error("Error creating cron:", error);
    return { error: "Failed to create cron" };
  }
}

export async function updateCron(id, formData) {
  try {
    const name = formData.get("name");
    const projectName = formData.get("projectName");
    const url = formData.get("url");
    const method = formData.get("method") || "GET";
    const headers = formData.get("headers");
    const body = formData.get("body");
    const comments = formData.get("comments");

    if (!name || !projectName || !url) {
      return { error: "Name, project, and URL are required" };
    }

    let parsedHeaders = null;
    if (headers && headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        return { error: "Headers must be valid JSON" };
      }
    }

    const cron = await prisma.cron.update({
      where: { id },
      data: {
        name,
        projectName,
        url,
        method,
        headers: parsedHeaders,
        body: body || null,
        comments: comments || null,
      },
    });

    revalidatePath("/dashboard/crons");
    return { success: true, cron };
  } catch (error) {
    console.error("Error updating cron:", error);
    return { error: "Failed to update cron" };
  }
}

export async function toggleArchiveCron(id) {
  try {
    const cron = await prisma.cron.findUnique({
      where: { id },
    });

    if (!cron) {
      return { error: "Cron not found" };
    }

    const updatedCron = await prisma.cron.update({
      where: { id },
      data: {
        isArchived: !cron.isArchived,
      },
    });

    revalidatePath("/dashboard/crons");
    return { success: true, cron: updatedCron };
  } catch (error) {
    console.error("Error toggling archive status:", error);
    return { error: "Failed to toggle archive status" };
  }
}

export async function updateCronResponse(id, responseData, responseType) {
  try {
    const cron = await prisma.cron.update({
      where: { id },
      data: {
        responseData,
        responseType,
        lastRunAt: new Date(),
      },
    });

    revalidatePath("/dashboard/crons");
    return { success: true, cron };
  } catch (error) {
    console.error("Error updating cron response:", error);
    return { error: "Failed to update cron response" };
  }
}

export async function runSingleCron(id) {
  try {
    const cron = await prisma.cron.findUnique({
      where: { id },
    });

    if (!cron) {
      return { error: "Cron not found" };
    }

    if (cron.isArchived) {
      return { error: "Cannot run archived cron" };
    }

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
          attempt: attempts + 1,
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
    const updatedCron = await prisma.cron.update({
      where: { id },
      data: {
        responseData,
        responseType,
        lastRunAt: new Date(),
      },
    });

    revalidatePath("/dashboard/crons");
    return {
      success: true,
      cron: updatedCron,
      responseData,
      responseType,
      attempts,
    };
  } catch (error) {
    console.error("Error running single cron:", error);
    return { error: "Failed to run cron job" };
  }
}
