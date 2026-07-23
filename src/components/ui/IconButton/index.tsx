"use client";
import {
  type ButtonHTMLAttributes,
  type HTMLAttributeAnchorTarget,
  forwardRef,
} from "react";
import { twMerge } from "tailwind-merge";
import { type ButtonVariantProps, switchVariant } from "../Button";
import Ripple from "../Ripple";
import CircularProgress from "../CircularProgress";

interface MoreProps {
  noRipple?: boolean;
  loading?: boolean;
  variant?: "contained" | "outlined" | "text";
  sizes?: "small" | "medium" | "large";
  onClickDownloadURL?: string;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  LinkComponent?: React.ComponentType<any>;
}

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps &
  MoreProps;

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props: IconButtonProps, ref) => {
    let {
      className,
      variant = "contained",
      color = "primary",
      sizes = "medium",
      loading,
      children,
      href,
      onClickDownloadURL,
      LinkComponent = "button",
      noRipple,
      ...rest
    } = props;

    if (rest.disabled) LinkComponent = "button";
    let choseVariant = switchVariant(variant, sizes, color, noRipple, true);

    if (onClickDownloadURL) {
      rest.onClick = () => {
        const a = document.createElement("a");
        a.href = onClickDownloadURL;
        a.click();
      };
    }

    return (
      <LinkComponent
        {...(href && { href: href })}
        ref={ref}
        title={rest.title || "icon button"}
        className={twMerge(
          "overflow-hidden relative",
          "focus:ring-offset-inherit",
          choseVariant,
          className,
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
        {...rest}
      >
        {loading && (
          <CircularProgress className="absolute inline-flex items-center" />
        )}
        <span
          className={twMerge(
            "transition",
            loading ? "opacity-0" : "opacity-100",
          )}
        >
          {children}
        </span>
        {!noRipple && !rest.disabled && (
          <Ripple
            color={
              variant === "contained" && color !== "white" ? undefined : color
            }
            opacity={
              variant === "contained" && color !== "white" ? undefined : 0.25
            }
            centerRipple
            rippleScale={variant === "text" ? 0.85 : 0.75}
            rippleScaleMax={1}
          />
        )}
      </LinkComponent>
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
