import { describe, it } from "vitest"
import request from "supertest"
import { app } from "@/app"

describe('GET /workspaces', () => {
  it('responds with json', async () => {
    request(app).get('/workspaces').expect(200)
  })
})
