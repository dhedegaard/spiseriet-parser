import "source-map-support/register";
import { APIGatewayProxyHandler } from "aws-lambda";
import Axios from "axios";
import { load } from "cheerio";

const getBody = async () => {
  const resp = await Axios.get<string>(
    "http://spiseriet8000.dk/spiseriet8000_ugens_menu/",
    {
      timeout: 5000
    }
  );
  return resp.data;
};

const parseDay = (doc: CheerioStatic, id: string) =>
  doc(`#${id}`)
    .text()
    .trim()
    .split("\n")
    .map(line => line.trim())
    .join("\n");

const parseDays = (body: string) => {
  const doc = load(body);
  return {
    mon: parseDay(doc, "mandag"),
    tue: parseDay(doc, "tirsdag"),
    wed: parseDay(doc, "onsdag"),
    thu: parseDay(doc, "torsdag"),
    fri: parseDay(doc, "fredag")
  };
};

export const menu: APIGatewayProxyHandler = async (_event, _context) => {
  const body = await getBody();
  const resp = parseDays(body);
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  };
};
