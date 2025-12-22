import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nodes, edges, name } = body;

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        name,
      },
    });
    
    return NextResponse.json({
        ...workflow,
        nodes: JSON.parse(workflow.nodes),
        edges: JSON.parse(workflow.edges)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}
