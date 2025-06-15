import prisma from "@/lib/prisma";

export async function findAllProducts() {
  return prisma.product.findMany();
}

export async function findProductByID(id: number) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(data: { price: number; name: string }) {
  return prisma.product.create({ data });
}
