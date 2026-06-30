import { getSolarTermValidation } from "@/lib/solar-term-validation";

export async function GET() {
  return Response.json(getSolarTermValidation());
}
