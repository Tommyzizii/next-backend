import corsHeaders from "../../../../lib/cors";
import { getClientPromise } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req, context) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid user id" },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const user = await db.collection("user").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } },
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(user, { status: 200, headers: corsHeaders });
  } catch (e) {
    return NextResponse.json(
      { message: e.toString() },
      { status: 500, headers: corsHeaders },
    );
  }
}

async function updateUser(req, context) {
  const { id } = await context.params;
  const data = await req.json();

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid user id" },
      { status: 400, headers: corsHeaders },
    );
  }

  const updateData = { ...data };
  if (typeof updateData.password === "string" && updateData.password.trim() !== "") {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  } else {
    delete updateData.password;
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200, headers: corsHeaders },
    );
  } catch (e) {
    return NextResponse.json(
      { message: e.toString() },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function PUT(req, context) {
  return updateUser(req, context);
}

export async function PATCH(req, context) {
  return updateUser(req, context);
}

export async function DELETE(req, context) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid user id" },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200, headers: corsHeaders },
    );
  } catch (e) {
    return NextResponse.json(
      { message: e.toString() },
      { status: 500, headers: corsHeaders },
    );
  }
}
