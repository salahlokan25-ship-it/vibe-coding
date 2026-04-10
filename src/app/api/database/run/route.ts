import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

export async function POST(req: NextRequest) {
    try {
        const { connectionString, sql } = await req.json()

        if (!connectionString) {
            return NextResponse.json({ success: false, error: 'Database connection string is required.' }, { status: 400 })
        }
        if (!sql) {
            return NextResponse.json({ success: false, error: 'SQL query is not provided.' }, { status: 400 })
        }

        // Initialize postgres client connection
        // Using SSL requirement as typical for Supabase and modern DBs
        const sqlClient = postgres(connectionString, { ssl: 'require', max: 1 })

        try {
            // Execute the raw SQL string
            // Danger: This splits complex schemas if not handled properly by postgres.js 
            // Postgres.js allows running multi-statement scripts via the `sql.unsafe` method
            const result = await sqlClient.unsafe(sql)

            await sqlClient.end()
            return NextResponse.json({ success: true, result })
        } catch (execErr: any) {
            await sqlClient.end()
            return NextResponse.json({ success: false, error: execErr.message }, { status: 500 })
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
