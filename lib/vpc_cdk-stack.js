const { Stack, Tags } = require('aws-cdk-lib');
const { CfnVPC, CfnSubnet, CfnRouteTable,CfnSubnetRouteTableAssociation,CfnRoute,CfnInternetGateway,CfnVPCGatewayAttachment, CfnNatGateway, CfnEIP } = require('aws-cdk-lib/aws-ec2');

class VpcCdkStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    Tags.of(scope).add('project', 'cdk'); // tag general que aplica a todos los recursos.
    Tags.of(scope).add('environment', 'test');

    // create vpc
    const cfn_vpc = new CfnVPC(this, 'vpc_root', {
      vpcName: 'vpc_root',
      cidrBlock: "10.0.0.0/16",
      enableDnsHostnames: true,
      enableDnsSupport: true,
      instanceTenancy: 'default',
      tags:[
        {
          key: 'Name',
          value: 'vpc_root'
        }
      ]
   });

   // create internet gateway
    const cfn_internet_gateway = new CfnInternetGateway(this,'internet_gateway',{
      tags:[
        {
          key: 'Name',
          value: 'internet_gateway'
        }
      ]
    });
    new CfnVPCGatewayAttachment(this,'internet_gateway_attachment',{
      vpcId: cfn_vpc.ref,
      internetGatewayId: cfn_internet_gateway.ref
    })

   // create subnet public
   const subnet_publica_1a = new CfnSubnet(this,'subnet_publica_1a',{
    vpcId: cfn_vpc.ref,
    assignIpv6AddressOnCreation: false,
    availabilityZone: this.availabilityZones[0],
    cidrBlock: '10.0.1.0/24',
    enableDns64: false,
    mapPublicIpOnLaunch: false,
    tags:[
      {
        key: 'Name',
        value: 'subnet_publica_1a'
      }
    ]
   });

   // create subnet private
   const subnet_privada_1a = new CfnSubnet(this,'subnet_privada_1a',{
    vpcId: cfn_vpc.ref,
    assignIpv6AddressOnCreation: false,
    availabilityZone: this.availabilityZones[0],
    cidrBlock: '10.0.4.0/24',
    enableDns64: false,
    mapPublicIpOnLaunch: false,
    tags:[
      {
        key: 'Name',
        value: 'subnet_privada_1a'
      }
    ]
   })
   //config route table public
   const route_table_public = new CfnRouteTable (this,'route_table_public',{
    vpcId: cfn_vpc.ref,
    tags: [
      {
        key: 'Name',
        value: 'route_table_public'
      }
    ]
   });
   // x asociaciones por subnet publicas
   new CfnSubnetRouteTableAssociation(this,'route_table_public_association',{
     routeTableId: route_table_public.ref,
     subnetId: subnet_publica_1a.ref
   });

   new CfnRoute(this,'route_public',{
    routeTableId: route_table_public.ref,
    destinationCidrBlock: '0.0.0.0/0',
    gatewayId: cfn_internet_gateway.ref
   });

   //config route table private
   const route_table_private_a = new CfnRouteTable (this,'route_table_private_a',{
    vpcId: cfn_vpc.ref,
    tags: [
      {
        key: 'Name',
        value: 'route_table_private_a'
      }
    ]
   });

   new CfnSubnetRouteTableAssociation(this,'route_table_private_association',{
    routeTableId: route_table_private_a.ref,
    subnetId: subnet_privada_1a.ref
  });

  const elastic_ip_a = new CfnEIP(this,'elastic_ip_a',{
    tags: [
      {
        key: 'Name',
        value: 'elastic_ip_a'
      }
    ]
  })

  // create natgateway
  const natgateway_a = new CfnNatGateway(this, 'natgateway_a',{
    subnetId: subnet_publica_1a.ref,
    allocationId:'',
    connectivityType: 'public',
  });

  new CfnRoute(this,'route_private_a',{
    routeTableId: route_table_private_a.ref,
    destinationCidrBlock: '0.0.0.0/0',
    natGatewayId: elastic_ip_a.ref
   });

  }
}

module.exports = { VpcCdkStack }
