import { NextRequest, NextResponse } from 'next/server'
import { createSwaggerSpec } from 'next-swagger-doc'
import swaggerConfig from '../../../swagger.config.js'

const spec = createSwaggerSpec(swaggerConfig)

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: API documentation (OpenAPI spec)
 *     description: Returns the OpenAPI 3.0 specification for this API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(spec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}