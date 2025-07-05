import Block from "@/components/block";
import clsx from "clsx";
import Image from "next/image";
import { Product } from "@/lib/types";
import { promises as fs } from "fs";
import { marked } from "marked";
import Header from "@/components/header";
import { getImageWithTimestamp } from "@/lib/imageUtils";

// This function gets called at build time
export async function generateStaticParams() {
  const file = await fs.readFile(
    process.cwd() + "/public/products.json",
    "utf8"
  );

  // Parsing JSON data
  const products = JSON.parse(file) as Product[];
  // Generating paths from data
  const paths = products.map((product) => ({ slug: product.slug }));
  return paths;
}

async function getData(slug: string): Promise<Product> {
  const file = await fs.readFile(
    process.cwd() + "/public/products.json",
    "utf8"
  );
  const data: Product[] = JSON.parse(file);
  const product = data.findIndex((p) => p.slug === slug);
  return data[product];
}

async function getManual(manual: string): Promise<string> {
  const file = await fs.readFile(process.cwd() + `/public/${manual}`, "utf8");
  return file;
}

function getRange(header1:string, header2:string, markdown: string[]): string {
  try {
    // 查找起始标题行的索引
    const start = markdown.findIndex((m) => m.trim().startsWith(header1));
    
    // 如果找不到起始标题，返回空字符串
    if (start === -1) {
      console.log(`Start header "${header1}" not found in markdown`);
      return '';
    }
    
    // 从起始位置开始查找结束标题的索引
    let end;
    if (header2 && header2.length > 0) {
      end = markdown.findIndex((m, i) => i > start && m.trim().startsWith(header2));
    } else {
      end = -1; // 如果未指定结束标题，将使用文件末尾
    }
    
    // 如果找不到结束标题，使用文件末尾
    if (end === -1) {
      end = markdown.length;
    }
    
    // 确保提取的范围有效
    if (start >= end || start < 0) {
      console.log(`Invalid range: start=${start}, end=${end}`);
      return '';
    }
    
    // 提取指定范围的内容并连接为字符串
    const range = markdown.slice(start, end);
    const content = range.join('\n');
    
    // 使用marked库将Markdown转换为HTML
    try {
      return marked.parse(content);
    } catch (e) {
      console.error('Error parsing markdown:', e);
      return content; // 如果解析失败，返回原始内容
    }
  } catch (e) {
    console.error('Error in getRange:', e);
    return '';
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const product = await getData(resolvedParams.slug);
  const manual = await getManual(product.manual);
  const mitems = manual.split("\n");

  const sections = [
    {
      start: "## Features",
      end: "## Technical",
    },
    {
      start: "## Reviews",
      end: "## FAQ",
    },
    {
      start: "## FAQ",
      end: "",
    },
    {
      start: "## Return",
      end: "## Reviews",
    },
    {
      start: "## Caution",
      end: "## Warranty",
    },
    {
      start: "## Technical",
      end: "## User Guide",
    },

    {
      start: "## Warranty",
      end: "## Return",
    },
    {
      start: "## User Guide",
      end: "## Caution",
    },
  ];

  const getSection = (idx: number) => {
    const section = sections[idx];
    const range = getRange(section.start, section.end, mitems);
    return range;
  };

  const extraclasses =
    "[&_li]:ml-8 [&_ol]:list-decimal [&_ul]:list-disc [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:pt-3 [&_h2]:pb-3" +
    "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:pt-3 [&_h3]:pb-3" +
    "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:pt-3 [&_h4]:pb-3" +
    "[&_ol]:list-decimal [&_ol]:list-outside [&_ul]:list-outside";
  return (
    <>
      <Header params={{slug: resolvedParams.slug}} searchParams={searchParams ? await searchParams : {}} />
      <Block innerClassName="pt-6 pb-6">
        <div className="text-6xl pb-5 pt-8 subpixel-antialiased font-serif ">
          {product.name}
        </div>
        <div
          className="first-line:uppercase first-line:tracking-widest
                  first-letter:text-8xl first-letter:font-bold first-letter:text-slate-900
                  first-letter:mr-3 first-letter:float-left"
        >
          {product.description}
        </div>
      </Block>
      {product.images.map((image, i) => (
        <Block
          key={i}
          outerClassName={clsx(i % 2 == 0 ? "bg-zinc-100" : "bg-inherit")}
          innerClassName={clsx(
            "p-6 flex items-start",
            i % 2 == 1 ? "flex-row-reverse" : "flex-row"
          )}
        >
          <Image
            src={getImageWithTimestamp(image)}
            alt={product.name}
            width={550}
            height={550}
            className="rounded-3xl mr-6"
          />
          <div
            className={clsx(
              "text-left mt-2 grow text-lg",
              extraclasses,
              i % 2 == 1 ? "mr-8" : "ml-8"
            )}
            dangerouslySetInnerHTML={{ __html: getSection(i) }}
          />
        </Block>
      ))}
      <Block innerClassName={clsx("p-4 flex items-start")}>
        <div
          className={clsx("text-left mt-2 grow", extraclasses)}
          dangerouslySetInnerHTML={{ __html: getSection(7) }}
        />
      </Block>
      <Block
        outerClassName="bg-zinc-100"
        innerClassName={clsx("p-6 flex items-start")}
      >
        <div
          className={clsx("text-left mt-2 grow pr-6", extraclasses)}
          dangerouslySetInnerHTML={{ __html: getSection(6) }}
        />
        <div
          className={clsx("text-left mt-2 grow pl-6", extraclasses)}
          dangerouslySetInnerHTML={{ __html: getSection(5) }}
        />
      </Block>
    </>
  );
}
