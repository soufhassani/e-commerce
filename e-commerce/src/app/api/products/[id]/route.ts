import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import productSchema from "@/features/products/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json(product, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validation = productSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.errors, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const updatedProduct = await prisma.product.update({
    where: { id: product.id },
    data: {
      name: body.name,
      price: body.price,
    },
  });

  return NextResponse.json(updatedProduct, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.product.delete({
    where: { id: product.id },
  });

  return NextResponse.json(
    { message: "Product was deleted successfully" },
    { status: 200 }
  );
}
