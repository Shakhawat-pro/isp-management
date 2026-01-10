import HomePage from "@/components/HomePage";
import { getAllClients } from "@/components/server";
import { sheets, SPREADSHEET_ID } from "@/lib/googleSheets";

export const dynamic = "force-dynamic"; // important: disable caching


export default async function Home() {
  let data;
  let error = null;
  try {
    const res = await getAllClients();
    data = res.data || [];
    
  } catch (err) {
    error = err;
  }
  
  if (error) {
    return (
      <div>
        <h1 className="text-red-500">Error loading data: {error.message}</h1>
      </div>
    );
  }

  return <HomePage initialData={data} />;
}
