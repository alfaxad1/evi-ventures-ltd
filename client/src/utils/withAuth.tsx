import React, { useEffect } from "react";
import { checkSession } from "./authUtils";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P) => {
    useEffect(() => {
      checkSession();
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
