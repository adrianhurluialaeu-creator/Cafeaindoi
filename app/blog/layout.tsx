import type {ReactNode} from "react";
import ArticleOpinion from "../../components/ArticleOpinion";
import {BlogBreadcrumbStructuredData} from "../../components/StructuredData";

export default function BlogLayout({children}:{children:ReactNode}){
 return <><BlogBreadcrumbStructuredData/>{children}<ArticleOpinion/></>;
}
