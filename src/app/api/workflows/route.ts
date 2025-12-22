import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nodes, edges } = body;

    const workflow = await prisma.workflow.create({
      data: {
        name: name || "Untitled Workflow",
        nodes: JSON.stringify(nodes || []), 
        edges: JSON.stringify(edges || []), 
      },
    });

    return NextResponse.json({
        ...workflow,
        nodes: JSON.parse(workflow.nodes),
        edges: JSON.parse(workflow.edges)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}
