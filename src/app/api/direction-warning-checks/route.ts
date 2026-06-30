import { getDirectionWarningValidation } from "@/lib/direction-warning-validation";

export async function GET() {
  return Response.json(getDirectionWarningValidation());
}
