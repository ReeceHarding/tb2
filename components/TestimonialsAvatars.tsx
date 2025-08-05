import Image from "next/image";

const avatars: {
  alt: string;
  src: string;
}[] = [
  {
    alt: "Student learning",
    // Using child-friendly illustrated avatars instead of real photos for privacy/safety
    src: "https://api.dicebear.com/7.x/big-smile/svg?seed=student1&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50",
  },
  {
    alt: "Student with notebook", 
    src: "https://api.dicebear.com/7.x/big-smile/svg?seed=student2&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50",
  },
  {
    alt: "Young learner",
    src: "https://api.dicebear.com/7.x/big-smile/svg?seed=student3&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50",
  },
  {
    alt: "Student writing",
    src: "https://api.dicebear.com/7.x/big-smile/svg?seed=student4&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50",
  },
  {
    alt: "Children learning together",
    src: "https://api.dicebear.com/7.x/big-smile/svg?seed=student5&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50",
  },
];

const TestimonialsAvatars = ({ priority }: { priority?: boolean }) => {
  return (
    <div className="flex flex-col md:flex-row justify-start items-start gap-3">
      {/* AVATARS */}
      <div className={`-space-x-5 avatar-group justify-start`}>
        {avatars.map((image, i) => (
          <div className="avatar w-12 h-12" key={i}>
            <Image
              src={image.src}
              alt={image.alt}
              priority={priority}
              width={50}
              height={50}
            />
          </div>
        ))}
      </div>

      {/* RATING */}
      <div className="flex flex-col justify-start items-start gap-1">
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-yellow-500 font-cal"
              key={i}
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>

        <div className="text-base text-base-content/80 font-cal">
          <span className="font-semibold text-base-content font-cal">500+</span> students
          learning on Timeback
        </div>
      </div>
    </div>
  );
};

export default TestimonialsAvatars;
