import withAuth from "../../utils/withAuth";

const LoanProducts = () => {
  return <div>Loan products</div>;
};

const AuthenticatedLoanProduct = withAuth(LoanProducts);
export { AuthenticatedLoanProduct as LoanProducts };
