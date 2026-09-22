import type {ReactNode} from "react";
import ArticleOpinion from "../../components/ArticleOpinion";

export default function BlogLayout({children}:{children:ReactNode}){
 return <>{children}<ArticleOpinion/></>;
}
