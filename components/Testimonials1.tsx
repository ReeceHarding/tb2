// A single testimonial following template style (no images)
const Testimonial = () => {
  return (
    <section
      className="py-24 px-4 max-w-7xl mx-auto"
      id="testimonials"
    >
      <div className="flex justify-center">
        <figure className="relative h-full w-full max-w-[550px] p-6 rounded-xl border border-timeback-primary bg-white hover:shadow-2xl transition-shadow duration-200">
          <blockquote className="relative">
            <div className="text-base xl:text-sm text-timeback-primary font-cal">
              <div className="space-y-2">
                <p>I got your boilerplate and having the payments setup with Stripe + user auth is a blessing. This will save me like a week of work for each new side project I spin up. I appreciate that is well documented, as well. 100% worth it!</p>
              </div>
            </div>
          </blockquote>
          <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 border-t border-timeback-primary/20">
            <div className="overflow-hidden rounded-full bg-base-300 shrink-0">
              <span className="w-10 h-10 rounded-full flex justify-center items-center text-lg font-medium bg-base-300 font-cal">
                A
              </span>
            </div>
            <div className="w-full flex items-end justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-timeback-primary font-cal">Amanda Lou</div>
                <div className="mt-0.5 text-sm text-timeback-primary/60 font-cal">Indie Maker &amp; Developer</div>
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default Testimonial;
