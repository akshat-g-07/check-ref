"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/db";

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function createProject(formData) {
  try {
    const name = formData.get("name");
    const url = formData.get("url");

    if (!name || !url) {
      return { error: "Name and URL are required" };
    }

    const project = await prisma.project.create({
      data: {
        name,
        url,
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, project };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: "Failed to create project" };
  }
}

export async function getRefs() {
  try {
    const refs = await prisma.ref.findMany({
      include: {
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });
    console.log(refs);
    return refs;
  } catch (error) {
    console.error("Error fetching refs:", error);
    return [];
  }
}

export async function createRef(data) {
  try {
    const { projectName, val } = data;

    const ref = await prisma.ref.create({
      data: {
        projectName,
        val,
      },
    });

    revalidatePath("/dashboard/read");
    return { success: true, ref };
  } catch (error) {
    console.error("Error creating ref:", error);
    return { error: "Failed to create ref" };
  }
}
