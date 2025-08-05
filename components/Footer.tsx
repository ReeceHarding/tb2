"use client";

import { motion } from "framer-motion";
import { animationVariants } from "@/libs/animations";

const Footer = () => {
  return (
    <motion.footer 
      className="bg-timeback-bg border-t border-timeback-primary/20"
      variants={animationVariants.fadeInUp}
      whileInView="animate"
      initial="initial"
      viewport={{ once: true, margin: "-100px" }}
    >

    </motion.footer>
  );
};

export default Footer;
