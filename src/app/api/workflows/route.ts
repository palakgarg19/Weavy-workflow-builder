import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const CreateWorkflowSchema = z.object({
  name: z.string().optional().default("Untitled Workflow"),
  nodes: z.array(z.any()).optional().default([]),
  edges: z.array(z.any()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateWorkflowSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid workflow data", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { name, nodes, edges } = parseResult.data;

    const workflow = await prisma.workflow.create({
      data: {
        name,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      },
    });

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    });
  } catch (error: any) {
    console.error("Create Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create workflow" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    const parsedWorkflows = workflows.map((w: any) => ({
      ...w,
      nodes: JSON.parse(w.nodes),
      edges: JSON.parse(w.edges)
    }));

    return NextResponse.json(parsedWorkflows);
  } catch (error: any) {
    console.error("Fetch Workflows Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}
