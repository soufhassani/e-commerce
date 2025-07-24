import { NextRequest, NextResponse } from "next/server";
import { createProduct, findAllProducts } from "@/features/products/service";
import productSchema from "@/features/products/schema";

export async function GET(nextRequest: NextRequest) {
  const products = await findAllProducts();
  return NextResponse.json(products, { status: 200 });
}

export async function POST(nextRequest: NextRequest) {
  const body = await nextRequest.json();
  const validation = productSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    );

  const product = await createProduct({
    name: body.name,
    price: body.price,
  });
  return NextResponse.json(product, { status: 201 });
}
