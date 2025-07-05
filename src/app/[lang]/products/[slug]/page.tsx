'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/language-context';
import Block from "@/components/block";
import clsx from "clsx";
import Image from "next/image";
import { Product } from "@/lib/types";
import { marked } from "marked";
import Header from "@/components/header";
import CountdownBanner from "@/components/countdown-banner";
import { getImageWithTimestamp } from "@/lib/imageUtils";
import TTSAudio from "@/components/tts-audio";

// 支持的语言列表
const supportedLocales = ['en', 'zh'];

export default function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { setLocale, locale } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [manual, setManual] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ lang: string; slug: string } | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ [key: string]: string | string[] | undefined } | null>(null);
  
  // 解析Promise类型的params和searchParams
  useEffect(() => {
    Promise.all([
      params,
      searchParams || Promise.resolve({})
    ]).then(([p, sp]) => {
      setResolvedParams(p);
      setResolvedSearchParams(sp);
    });
  }, [params, searchParams]);
  
  // 获取根据当前语言的章节定义
  const getSectionsByLocale = (currentLocale: string) => {
    if (currentLocale === 'zh') {
      return [
        { start: "## 功能特点", end: "## 技术规格" },
        { start: "## 评论", end: "## 常见问题" },
        { start: "## 常见问题", end: "" },
        { start: "## 退货政策", end: "## 评论" },
        { start: "## 注意事项", end: "## 保修信息" },
        { start: "## 技术规格", end: "## 用户指南" },
        { start: "## 保修信息", end: "## 退货政策" },
        { start: "## 用户指南", end: "## 注意事项" },
      ];
    } else {
      return [
        { start: "## Features", end: "## Technical" },
        { start: "## Reviews", end: "## FAQ" },
        { start: "## FAQ", end: "" },
        { start: "## Return", end: "## Reviews" },
        { start: "## Caution", end: "## Warranty" },
        { start: "## Technical", end: "## User Guide" },
        { start: "## Warranty", end: "## Return" },
        { start: "## User Guide", end: "## Caution" },
      ];
    }
  };
  
  const [sections, setSections] = useState<{ start: string; end: string }[]>(getSectionsByLocale(locale));
  
  // 当语言变化时更新章节
  useEffect(() => {
    setSections(getSectionsByLocale(locale));
  }, [locale]);
  
  // 设置客户端标识，防止水合错误
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 当组件加载时，更新语言上下文
  useEffect(() => {
    if (resolvedParams?.lang && supportedLocales.includes(resolvedParams.lang) && isClient) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', resolvedParams.lang);
      }
      setLocale(resolvedParams.lang);
    }
  }, [resolvedParams?.lang, setLocale, isClient]);
  
  // 获取产品数据
  useEffect(() => {
    if (!isClient || !resolvedParams) return;
    
    async function fetchData() {
      try {
        // 添加随机参数防止缓存问题
        const response = await fetch(`/products.json?_=${new Date().getTime()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        
        const products = await response.json();
        const foundProduct = products.find((p: Product) => p.slug === resolvedParams?.slug);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // 获取产品手册，尝试获取对应语言版本
          try {
            let manualUrl = '';
            let manualResponse;
            
            // 根据产品slug或manual字段中的文件名找到对应的手册文件
            const getManualFilename = () => {
              // 从manual字段中提取文件名
              const manualFilename = foundProduct.manual.split('/').pop();
              // 尝试使用product_info_{数字}.md格式
              const match = manualFilename?.match(/product_info_(\d+)\.md/);
              if (match) {
                return `product_info_${match[1]}.md`;
              }
              // 如果没有匹配到数字格式，则使用产品slug生成文件名
              return `${resolvedParams?.slug}.md`;
            };
            
            const manualFilename = getManualFilename();
            
            if (locale === 'zh') {
              // 构建中文手册URL
              manualUrl = `/manuals/zh/${manualFilename}?_=${new Date().getTime()}`;
              
              manualResponse = await fetch(manualUrl);
              
              // 如果中文版本不存在，回退到英文版
              if (!manualResponse.ok) {
                console.log(`Chinese manual not found (${manualUrl}), falling back to English version`);
                manualUrl = `${foundProduct.manual}?_=${new Date().getTime()}`;
                manualResponse = await fetch(manualUrl);
              }
            } else {
              // 英文版本
              manualUrl = `${foundProduct.manual}?_=${new Date().getTime()}`;
              manualResponse = await fetch(manualUrl);
            }
            
            // 检查是否成功获取手册内容
            if (manualResponse.ok) {
              const manualText = await manualResponse.text();
              console.log(`Successfully loaded manual from ${manualUrl}, length: ${manualText.length} bytes`);
              setManual(manualText);
            } else {
              console.error(`Failed to fetch manual from ${manualUrl}: ${manualResponse.status}`);
              setManual('# Product Information\n\nProduct information is currently unavailable.');
            }
          } catch (e) {
            console.error('Error fetching manual:', e);
            setManual('# Product Information\n\nUnable to load product information.');
          }
        } else {
          console.error(`Product with slug ${resolvedParams?.slug} not found`);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
    
    fetchData();
  }, [resolvedParams?.slug, locale, isClient, resolvedParams]);
  
  // 解析Markdown章节
  const getSection = (idx: number) => {
    // 检查手册内容和节索引是否有效
    if (!manual || !sections[idx]) {
      console.log(`Manual content or section index ${idx} is invalid. Manual length: ${manual?.length || 0}, Sections: ${JSON.stringify(sections)}`);
      return '';
    }
    
    // 获取指定章节内容的函数
    const getRange = (header1: string, header2: string): string => {
      try {
        // 分割手册内容为行数组
        const mitems = manual.split('\n');
        
        // 查找起始标题行的索引
        const start = mitems.findIndex((m) => m.trim().startsWith(header1));
        
        // 如果找不到起始标题，返回空字符串
        if (start === -1) {
          console.log(`Start header "${header1}" not found in manual. Available headers: ${mitems.filter(line => line.trim().startsWith('##')).join(', ')}`);
          return '';
        }
        
        // 从起始位置开始查找结束标题的索引
        let end;
        if (header2 && header2.length > 0) {
          end = mitems.findIndex((m, i) => i > start && m.trim().startsWith(header2));
        } else {
          end = -1; // 如果未指定结束标题，将使用文件末尾
        }
        
        // 如果找不到结束标题，使用文件末尾
        if (end === -1) {
          end = mitems.length;
          console.log(`End header "${header2}" not found, using end of file (line ${end})`);
        } else {
          console.log(`Found end header "${header2}" at line ${end}`);
        }
        
        // 确保提取的范围有效
        if (start >= end || start < 0) {
          console.log(`Invalid range: start=${start}, end=${end}`);
          return '';
        }
        
        // 提取指定范围的内容并连接为字符串
        const range = mitems.slice(start, end);
        const content = range.join('\n');
        console.log(`Extracted content from ${start} to ${end}, length: ${content.length} bytes`);
        
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
    };
    
    try {
      const section = sections[idx];
      console.log(`Getting section ${idx}: ${section.start} to ${section.end}`);
      return getRange(section.start, section.end);
    } catch (e) {
      console.error(`Error getting section ${idx}:`, e);
      return '';
    }
  };
  
  // 样式类
  const extraclasses = "[&_li]:ml-8 [&_ol]:list-decimal [&_ul]:list-disc [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:pt-3 [&_h2]:pb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:pt-3 [&_h3]:pb-3 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:pt-3 [&_h4]:pb-3 [&_ol]:list-decimal [&_ol]:list-outside [&_ul]:list-outside";
  
  // 在服务器端渲染时显示简单的加载状态，防止水合错误
  if (!isClient || !resolvedParams) {
    return (
      <>
        <Header params={{slug: ''}} searchParams={resolvedSearchParams || {}} />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }
  
  // 产品页面未加载完成时
  if (!product) {
    return (
      <>
        <Header params={{slug: resolvedParams?.slug || ''}} searchParams={resolvedSearchParams || {}} />
        <Block innerClassName="pt-6 pb-6">
          <div className="text-center py-8">
            {locale === 'zh' ? '正在加载...' : 'Loading...'}
          </div>
        </Block>
      </>
    );
  }
  
  // 渲染产品页面
  return (
    <>
      {/* Countdown Banner */}
      <CountdownBanner productSlug={resolvedParams?.slug || ''} />
      
      <Header params={{slug: resolvedParams?.slug || ''}} searchParams={resolvedSearchParams || {}} />
      <Block innerClassName="pt-32 pb-6">
        <div className="text-6xl pb-5 pt-8 subpixel-antialiased font-serif ">
          {product.nameZh && locale === 'zh' ? product.nameZh : product.name}
        </div>
        <div
          className="first-line:uppercase first-line:tracking-widest
                  first-letter:text-8xl first-letter:font-bold first-letter:text-slate-900
                  first-letter:mr-3 first-letter:float-left"
        >
          {/* Add TTS Audio component for Meowtica Smart Hub (Product ID: 1) */}
          {product.id === 1 && (
            <div className="mb-4 clear-both">
              <TTSAudio 
                productSlug={product.slug}
                className="mb-3"
              />
            </div>
          )}
          {product.descriptionZh && locale === 'zh' ? product.descriptionZh : product.description}
        </div>
      </Block>
      
      {/* 显示所有产品图片 */}
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
            alt={product.nameZh && locale === 'zh' ? product.nameZh : product.name}
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
      
      {/* 显示剩余的章节 */}
      {product.images.length < 8 && (
        <>
          {Array.from({ length: 8 - product.images.length }).map((_, i) => {
            const sectionIdx = i + product.images.length;
            const sectionContent = getSection(sectionIdx);
            
            // 跳过空白章节
            if (!sectionContent) return null;
            
            return (
              <Block 
                key={`additional-${i}`}
                outerClassName={clsx(i % 2 == 0 ? "bg-zinc-100" : "bg-inherit")}
                innerClassName="p-6"
              >
                <div
                  className={clsx("text-left mt-2", extraclasses)}
                  dangerouslySetInnerHTML={{ __html: sectionContent }}
                />
              </Block>
            );
          })}
        </>
      )}
    </>
  );
}