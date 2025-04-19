import withAuth from "../../utils/withAuth";

const PaidLoans = () => {
  return <div>paid</div>;
};

const AuthenticatedPaidLoans = withAuth(PaidLoans);
export { AuthenticatedPaidLoans as PaidLoans };
