import type { JSX } from "react";
import Link from "next/link";
import { categoryType } from "../content";

// This is the category card that appears in the home page and in the category page
const CardCategory = ({
  category,
  tag = "h2",
}: {
  category: categoryType;
  tag?: keyof JSX.IntrinsicElements;
}) => {
  const TitleTag = tag;

  return (
    <Link
      className="p-4 bg-white border border-timeback-primary text-timeback-primary rounded-xl duration-200 hover:bg-timeback-bg hover:text-timeback-primary shadow-2xl hover:shadow-2xl font-cal"
      href={`/blog/category/${category.slug}`}
      title={category.title}
      rel="tag"
    >
      <TitleTag className="md:text-lg font-medium font-cal">
        {category?.titleShort || category.title}
      </TitleTag>
    </Link>
  );
};

export default CardCategory;
