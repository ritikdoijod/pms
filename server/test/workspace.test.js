import { describe, it } from "vitest"
import request from "supertest"
import { app } from "@/app"

describe('GET /workspaces', () => {
  it('responds with json', () => {
    request(app).get('/workspaces').expect(200)
  })
})
