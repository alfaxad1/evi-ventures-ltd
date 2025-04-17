import withAuth from "../../utils/withAuth";

const AddLoanProduct = () => {
  return <div>Add loan product</div>;
};

const AuthenticatedAddLoanProduct = withAuth(AddLoanProduct);
export { AuthenticatedAddLoanProduct as AddLoanProduct };
