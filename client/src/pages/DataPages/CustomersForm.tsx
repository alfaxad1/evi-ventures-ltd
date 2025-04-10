import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";

const CustomersForm = () => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input type="text" placeholder="name" />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input type="text" placeholder="name" />
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input type="text" placeholder="name" />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Select
            options={[
              { value: "1", label: "Option 1" },
              { value: "2", label: "Option 2" },
              { value: "3", label: "Option 3" },
            ]}
            placeholder="Select Option"
            onChange={(value) => console.log(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomersForm;
