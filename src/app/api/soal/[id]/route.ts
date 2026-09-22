import { NextResponse } from "next/server"

export async function GET() {
	return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 })
}
