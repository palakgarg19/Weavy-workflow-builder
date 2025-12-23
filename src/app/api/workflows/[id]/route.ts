import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateWorkflowSchema = z.object({
  name: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });
    if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    });
  } catch (error: any) {
    console.error("Fetch Workflow By ID Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parseResult = UpdateWorkflowSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid workflow data", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { nodes, edges, name } = parseResult.data;

    const updateData: any = {};
    if (nodes) updateData.nodes = JSON.stringify(nodes);
    if (edges) updateData.edges = JSON.stringify(edges);
    if (name) updateData.name = name;

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    });
  } catch (error: any) {
    console.error("Update Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update workflow" },
      { status: 500 }
    );
  }
}
