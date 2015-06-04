'use strict';

angular.module('snippit', ['snippit.main',
  'snippit.services',
  'snippit.three',
  'snippit.auth',
  'snippit.profile',
  'ui.router'
  ])
  // This run block checks whether the user is authenticated or not by making
  // a get request to the '/auth/isAuthenticated' route and upon a successful
  // request, checks the response to see if the user is authenticated and
  // redirects them to the 'signin' state if they're not authenticated. This
  // happens on any state change.
  .run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
    $rootScope.$on('$stateChangeStart', function(e, toState) {
      if (toState && toState.authenticate) {
        $http.get('/auth/isAuthenticated').success(function(resp) {
          if (!resp.auth) {
            $location.path('/signin');
          }
        });
      }
    });
  }])
  // Configures the various states for the application.
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        templateUrl: 'templates/main.html',
        controller: 'MainController',
        authenticate: true
      })
      .state('app.three', {
        url: '/three',
        views: {
          'content': {
            templateUrl: 'templates/three.html',
            controller: 'ThreeController'
          }
        },
        authenticate: true
      })
      .state('app.profile', {
        url: '/profile',
        views: {
          'content': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileController'
          }
        },
        authenticate: true
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'templates/signin.html',
        controller: 'AuthController',
      });
    // If a requested state is invalid, it will redirect to the three state
    $urlRouterProvider.otherwise('/app/three');
  }]);


'use strict';

angular.module('snippit.auth', ['snippit'])
  .controller('AuthController', ['$scope', '$window', 'ThreeFactory', function($scope, $window, ThreeFactory) {

    var scene, renderer, camera;
    var timer = 0;

    var picData = ['https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1185211_823282829464_354108398_n.jpg?oh=5882d0610f1a7d40d5759d46ce4810be&oe=5603CB68', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/542239_823282839444_1305682643_n.jpg?oh=1addc6990382b8d12dc03b85797527fa&oe=56079A72', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/970575_823282854414_1410067757_n.jpg?oh=9f552a89069a5f081e3f1ad91a422e6b&oe=560CA3FB', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1185587_823282969184_95658075_n.jpg?oh=bf273e5fa9b2cace04f33010ff572749&oe=560261FF', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1238819_823282959204_477572775_n.jpg?oh=92b3685d0a0ba7423e04bbf7e26bb48e&oe=55F544C0', 'https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/p130x130/969816_823282999124_1386630630_n.jpg?oh=0fc1c7dbaf64f2b28d4f7fbb8ebe3ff4&oe=55C20F79', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1173751_823283078964_1701379857_n.jpg?oh=7f99fb6fcc6d3d1f2c2ac4b5f5bdbc5c&oe=56055D5E', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/p130x130/1176277_823283083954_1469777998_n.jpg?oh=7bbaed40ed85058cdf922ee6e58ec1de&oe=55FAC28B', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1184828_823283113894_1524896066_n.jpg?oh=f5d29e3a003e0dd57f11dde1a5f29fc1&oe=56067702', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1175258_823283233654_1840008468_n.jpg?oh=3e54de6c2526245a297ccfed23566765&oe=55BEE528', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/p130x130/1234345_823283258604_2142804545_n.jpg?oh=1bb943f68191298ad559e685ac0f6551&oe=55F6C3F1', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1157731_823283253614_1182042706_n.jpg?oh=5139a6ff05a0f17df35117340d6c2615&oe=5606A6F3', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1170702_823283303514_137003356_n.jpg?oh=4a9f639814070fb6575ef6705d7c6bb5&oe=55FA26E5', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1209050_823283338444_433726798_n.jpg?oh=8e56a1fe4a3a8bad7921d1a489477cc7&oe=55C39D69', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1237908_823283343434_1221591256_n.jpg?oh=1f337aae6dfe88065de1b8bc83502866&oe=55F29F11', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1174809_823283393334_804610605_n.jpg?oh=06afff3ede4f74d57ece56b54a4a5c0d&oe=5608F966', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/264490_823283453214_452876632_n.jpg?oh=dd82560e58a4f0e50d921b7d3a639d49&oe=55BFEB4F', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1280824_823283458204_290392342_n.jpg?oh=fc7123778660843e7903d219c1378dfc&oe=56063F17', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1238019_823283488144_1182428090_n.jpg?oh=ca344f24dfb5dc010d7d7fd1b61e4239&oe=55FC3A62', 'https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/p130x130/998947_823283523074_958571860_n.jpg?oh=fb617b5cabcdf8c534f0cf392a9386e7&oe=5605CC4A', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1240297_823283528064_277079076_n.jpg?oh=2ce537e6b4565638749a2b04845ce31b&oe=55FF7E9C', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/603106_823283572974_983893210_n.jpg?oh=74bb24c5c46b01ae3b457e7e5f0f24ad&oe=55FEC0F3', 'https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/p130x130/1255475_823283642834_2087698776_n.jpg?oh=e3d6df1cbd28f826538128221a0ac6d5&oe=5608AA7F', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1000951_823283612894_1896605625_n.jpg?oh=91d2adac123de20273ace02a223aa553&oe=55FB059A', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/264470_823283677764_456650825_n.jpg?oh=5ef6e6fa47ebd84c2a1f619efbe84018&oe=55F1A3D7', 'https://scontent.xx.fbcdn.net/hphotos-xfa1/v/t1.0-9/p130x130/3627_823283697724_1845219424_n.jpg?oh=0db4d1c60395bc4e057e44d99a2ead22&oe=5603DDB5', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1185948_823283712694_1099898212_n.jpg?oh=fc2ee1b84ac178c144f1024e9f03a41a&oe=5607E85C', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1009855_823283757604_872575201_n.jpg?oh=55bf619b73e0ec8281d58c9c5333f7df&oe=560DC7C7', 'https://scontent.xx.fbcdn.net/hphotos-xaf1/v/t1.0-9/p130x130/1229913_823283767584_1057669256_n.jpg?oh=b397aa47940b9216a0a04356e6766600&oe=55F9E441', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/p130x130/1209081_823283827464_61885619_n.jpg?oh=90eccbe2b846be18e74933b3f10b1eb3&oe=56082F5E', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1234354_823283887344_448276236_n.jpg?oh=7248418cc29136ed15c251334189500b&oe=55C1EB1E', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1239752_823283872374_936403787_n.jpg?oh=f8418ab3d3b318a1b51b2535a3bb6746&oe=560A4247', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1240515_823283942234_65840176_n.jpg?oh=311da0f2c3b7f48aa198b3ad0f104b6d&oe=55C16A6B', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1185049_823283982154_200647619_n.jpg?oh=8ac5913741be150a62ea868bdea26272&oe=55FA588B', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1185918_823283977164_1741712904_n.jpg?oh=d2fa681d09fc8fd661aaf87bb918450e&oe=560775D0', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/72826_823284017084_708109109_n.jpg?oh=d4e0a9d1da5844648a2cf8268ad5b8f3&oe=56003B7E', 'https://scontent.xx.fbcdn.net/hphotos-xpt1/v/t1.0-9/p130x130/1016996_823284126864_104191487_n.jpg?oh=881aad823e9147d7df14ae7832f3dfb0&oe=5605AFD8', 'https://scontent.xx.fbcdn.net/hphotos-xta1/v/t1.0-9/p130x130/1238839_823284111894_224946398_n.jpg?oh=fe1aeb0b3c1a8ba78996ae34f47d84b5&oe=560082DD', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1240509_823284151814_1866564269_n.jpg?oh=cb81494df52d7324ce18d146055c7954&oe=55F98708', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1173811_823284216684_1176079627_n.jpg?oh=5228098994e96599588010df171df454&oe=55F4DC7C', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/p130x130/1229853_823284221674_1969918400_n.jpg?oh=f71925b36ddb0da8a0485f084dcdba83&oe=55F36C76', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/q84/p130x130/1000344_823284436244_1012248646_n.jpg?oh=abc0d8f87178655630ec45a5c388edf0&oe=560128DB', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/q85/p130x130/75909_823284426264_948145797_n.jpg?oh=7ab867afe9e338830754e0d29b0690be&oe=560D539D', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1236914_823284446224_1120863773_n.jpg?oh=71de41c1843b6a85de6d18e9d3567a5f&oe=5603E44C', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1185222_823284560994_1149251718_n.jpg?oh=e783ace7cf79c3e57f33aa93a159e2b7&oe=55F857D9', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/q83/p130x130/560504_823284595924_339668561_n.jpg?oh=824fd234fbb83a88d931ef4c10eedff2&oe=55F24BA4', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/q86/p130x130/1002625_823284620874_908982661_n.jpg?oh=42c2fcfc046d0f38da17ede02db73706&oe=56013AE5', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1234891_823284655804_382329760_n.jpg?oh=c2dbd65561243eaa3ba08eb36c3cc13e&oe=5600236A', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1001126_823284680754_538663230_n.jpg?oh=65b35a1e93faab2caf2e6ac4318d0b49&oe=55F208CF', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1157701_823284745624_64838975_n.jpg?oh=1473ede5396b85f81511bf663700693b&oe=55FFF1A5', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/q84/p130x130/1231501_823284780554_870676983_n.jpg?oh=bf22899fbdbb261ccfb95d8e05385330&oe=56044BB9', 'https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/q82/p130x130/1236028_823284800514_1283391229_n.jpg?oh=e36710b183af3f4296c48cf0cdf95a4f&oe=55C3CEBD', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/q88/p130x130/1185193_823284835444_488705951_n.jpg?oh=2d9cc3dc71d30b5adf53d59187e86020&oe=56085AC0', 'https://scontent.xx.fbcdn.net/hphotos-xfa1/v/t1.0-9/q86/p130x130/1208811_823284860394_1806529952_n.jpg?oh=6e533ddd2d48f77687eb58ef99edd267&oe=55FC6B23', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1173911_823284905304_194629320_n.jpg?oh=472467de0dd1760ce5882fbf81bf2f67&oe=55F7ECC5', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1239558_823284920274_219563939_n.jpg?oh=e417e1942fd83d2847d5a72560a1b44b&oe=55FC8F0F', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1176303_823284965184_874097880_n.jpg?oh=f97001849a1332558ab8ab13dd903fbb&oe=55C4A6AC', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1234188_823285094924_1721064910_n.jpg?oh=e47e1eb8db462516e8f9ab2e582323c5&oe=5601A7C2', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1000627_823285099914_498269983_n.jpg?oh=04a4d17238011f50b063f2ba42ad4ce1&oe=55F738DC', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/998101_823285114884_2067554585_n.jpg?oh=e4c3ab04f1b332962145baee2e4e0864&oe=560B95B7', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1239572_823285164784_930091530_n.jpg?oh=ea5afcf958ec973c14243990adf1c2b9&oe=5603F2CF', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/998101_823285184744_519308887_n.jpg?oh=b799c0893ca940a18bd020038d6fcd98&oe=55C1A5CE', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1012506_823285214684_1509896075_n.jpg?oh=77e157693882781df4e01e0c916d05e9&oe=55F0E2A9', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1185597_823285264584_1720444061_n.jpg?oh=ebbffc3c6b6fa741da4a555fcf4c1d51&oe=55F66334', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/993370_823285269574_481794686_n.jpg?oh=fd34aca2d5ed1bb715431c9e7c3c0cd1&oe=560AE271', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1234094_823285484144_1276247579_n.jpg?oh=d6bb230559e7c600f65d923147efd0ef&oe=55F13606', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1157430_823285454204_19630720_n.jpg?oh=9261253ba4fdfc8a5d203790718afab7&oe=5602FF13', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/q82/p130x130/1003059_823285449214_1024213407_n.jpg?oh=daa6890f52b6b94e14771b6343894701&oe=55C12163', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/66963_823285539034_436308785_n.jpg?oh=4fb5adfa02405475a28d914c4a339bf1&oe=55F1FBDA', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1239970_823285598914_1195171374_n.jpg?oh=4262e4dfe5abc5c6488c0701d4f7de2e&oe=55F59506', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1233489_823285593924_2056100001_n.jpg?oh=65592bdaf0de416a3948496acdf536c0&oe=55C11BE6', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1186267_823285613884_1123554193_n.jpg?oh=9828438a6c356927b0bcb9847a3138d5&oe=56032305', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/q82/p130x130/1239925_823285678754_1781703871_n.jpg?oh=92ba6f3c28319ef5b40823cbb13653cd&oe=55F7C740', 'https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/p130x130/1174530_823285713684_1415312208_n.jpg?oh=421a532db93e0c504f333d363e2f7363&oe=55BF5EB6', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1238845_823285708694_1173090821_n.jpg?oh=3c145056588da977580eb91735dc07b3&oe=55F0D270', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1176258_823285768574_203808144_n.jpg?oh=5cb9370f8e41d29ce44e39ae29c46b88&oe=55FD9186', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/1236477_823285783544_343895573_n.jpg?oh=d64daecbc0dd92627fa961bd89a6f5c2&oe=560CDAEE', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1009864_823285788534_831013511_n.jpg?oh=cd25bba6913a0284fe8c155beb6fe80a&oe=5605CEE9', 'https://scontent.xx.fbcdn.net/hphotos-xat1/v/t1.0-9/q83/p130x130/1233467_823285923264_571281449_n.jpg?oh=98ea2f61179afc58ee161fdabaf0fb18&oe=55FFACFA', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/q82/p130x130/1173882_823285953204_437861712_n.jpg?oh=ff35b7046438c99d62cb20974ac16cf0&oe=55C0A6A9', 'https://scontent.xx.fbcdn.net/hphotos-xat1/v/t1.0-9/p130x130/1239718_823285928254_1709066297_n.jpg?oh=2bbcce7356ef4124848eb8de3a13888b&oe=55F5975E', 'https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/p130x130/1000951_823285978154_936126139_n.jpg?oh=7ec9a18f8a36254fd7ac522962d5e423&oe=55F60077', 'https://scontent.xx.fbcdn.net/hphotos-prn2/v/t1.0-9/p130x130/565028_823285993124_985288976_n.jpg?oh=cd86984b50a4c3ae451210bc4e1c21d7&oe=5600DC48', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1814_823286028054_359852282_n.jpg?oh=b3e7229564cf7f080be668d640168090&oe=56012BE6', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1208829_823286053004_1932935207_n.jpg?oh=c42f0182a1fe3d6fdb5b287dda252699&oe=55C22AD0', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1234912_823286122864_1791955428_n.jpg?oh=c838af1eec1a94b469d1b16d460a669d&oe=55F18481', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1174620_823286137834_355906047_n.jpg?oh=b4be4eeb76fe25b18699fa55e0265899&oe=560268A6', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1239992_823286172764_1634296958_n.jpg?oh=883389e5c939b3dec9ae67ee049e2c67&oe=5601C3CF', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1238293_823286192724_1985215288_n.jpg?oh=61cd22045fd58a5175dc3164d92db600&oe=55C08D39', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1236549_823286207694_108652685_n.jpg?oh=652a0504c611859d92dc20fa429cd01a&oe=55C4714C', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1175267_823286237634_641632417_n.jpg?oh=1a9d837715656097c9435cc4269df485&oe=55C0F4DC', 'https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/p130x130/970790_823286242624_635432069_n.jpg?oh=e4fb27da6406845a4177a8b3fc149be4&oe=560B7B9B', 'https://scontent.xx.fbcdn.net/hphotos-xat1/v/t1.0-9/p130x130/1238852_823286277554_1506474318_n.jpg?oh=13a21b4eccef97dda19b6a04613cd989&oe=55FA211F', 'https://scontent.xx.fbcdn.net/hphotos-ash2/v/t1.0-9/p130x130/1234486_823286302504_4453628_n.jpg?oh=8a8324674236f9b09bf1880a5e548dc1&oe=55C27E7F', 'https://scontent.xx.fbcdn.net/hphotos-xft1/v/t1.0-9/p130x130/1240531_823286317474_1130115694_n.jpg?oh=ddbb939e253ddf8d0c101d3e6cebae96&oe=55F0199A', 'https://scontent.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/p130x130/1173808_823286327454_1874489556_n.jpg?oh=ad106894cec9e723ea9614cd8b796ec4&oe=55F249CC', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/1236566_823286497114_1374411433_n.jpg?oh=385fb18f7f8c4c86caa392c6b74a050d&oe=560C7236', 'https://scontent.xx.fbcdn.net/hphotos-xfa1/v/t1.0-9/p130x130/1234589_823286492124_2118764502_n.jpg?oh=dce7016bd6e614ba3f6087697fad2ac2&oe=55F7F10F', 'https://scontent.xx.fbcdn.net/hphotos-frc3/v/t1.0-9/p130x130/564406_823286527054_1542208854_n.jpg?oh=ca84000962bd59ea9b9700f785294e72&oe=55FC42B2', 'https://scontent.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/p130x130/1236695_823286581944_1211903381_n.jpg?oh=7e71ed2e89b56896e6218e799437adca&oe=55F85AA3'];

    $scope.objects = [];
    $scope.targets = {sphere: []};

    var init = function() {
      camera = new THREE.PerspectiveCamera(30, $window.innerWidth / $window.innerHeight, 1, 10000);
      camera.position.z = 3000;
      scene = new THREE.Scene();

      var vector = new THREE.Vector3();
      var len = 60;

      for (var i = 0; i < len; i++) {
        ThreeFactory.createObject(i, picData, scene, $scope.objects);
        ThreeFactory.sphere(i, vector, $scope.targets.sphere, 800, len);
      }

      console.log($scope.objects[0].element);


      renderer = new THREE.CSS3DRenderer();
      renderer.setSize($window.innerWidth, $window.innerHeight);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.classList.add('render');

      $scope.transform($scope.targets.sphere, 2000);

      document.getElementById('signin').appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize, false);
    };

    $scope.transform = function(targets, duration) {

      TWEEN.removeAll();

      for (var i = 0; i < $scope.objects.length; i++) {
        var object = $scope.objects[i];
        var target = targets[i];

        new TWEEN.Tween(object.position)
          .to({x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration * 10 + duration + 3000)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(object.rotation)
          .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration * 10 + duration + 3000)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }


      new TWEEN.Tween(this)
        .to({}, duration * 5)
        .onUpdate($scope.render)
        .start();
    };


    var onWindowResize = function() {

      camera.aspect = window.innerWidth / $window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, $window.innerHeight);

      $scope.render();
    };


    var animate = function() {
      requestAnimationFrame(animate);
      TWEEN.update();
      timer += 0.001;
      camera.position.x = 3000 * Math.sin(timer);
      camera.position.z = 3000 * Math.cos(timer);
      // camera.position.y = 3000 * Math.cos(timer * 3);

      camera.up = new THREE.Vector3(0, 1, 0);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      $scope.render();
    };

    angular.element(document).ready(function() {
      init();
      animate();
    });

    $scope.render = function() {
      renderer.render(scene, camera);
    };

  }]);

'use strict';

angular.module('snippit.main', ['snippit', 'snippit.services'])
  .controller('MainController', ['$scope', function($scope) {
  }]);

'use strict';

angular.module('snippit.profile', ['snippit'])
  .controller('ProfileController', ['$scope', 'Facebook', '$window', function($scope, Facebook, $window) {

    // Facebook user data (as of right now, name and id)
    $scope.facebookUser = {};

    $scope.snipTab = false;

    // Album names
    $scope.albumNames = [];

    // Album photos
    $scope.albumPhotos = [];

    $scope.snipName = '';

    $scope.newSnip = true;

    // Snip photos
    $scope.snipPhotos = [];

    // Snips
    $scope.snips = {};

    // Invoke Facebook getFacebook user method, on success, assign
    // $scope.facebookUser to that response (Facebook name and id).
    $scope.fetchUser = function() {
      Facebook.getFacebookUser().success(function(resp) {
        $scope.facebookUser = resp;
      });
    };

    $scope.snipAdd = function() {
      $scope.snips[$scope.snipName] = $scope.snipPhotos;
      $scope.snipPhotos = [];

      //snip saving code to go here
      //make routes to redirect to saving on the mongo database server side
      //...on the server side we'll have a new snips database
      //
    };

    $scope.snipClose = function() {
      if ($scope.snipPhotos.length === 0) {
        delete $scope.snips[$scope.snipName];
      } else {
        $scope.snips[$scope.snipName] = $scope.snipPhotos;
      }
      $scope.snipPhotos = [];
      $scope.snipName = '';
      $scope.newSnip = true;
    };

    $scope.showAlbums = function() {
      $scope.snipTab = false;
    };

    $scope.showSnips = function() {
      $scope.snipTab = true;
    };

    // This function is invoked every time an album name is clicked on the
    // profile page. It passes the Facebook service's getAlbumPhotos method
    // the name and ID of the clicked album, which returns a promise. Upon
    // success, we are given a response, which are the photos for that specific
    // Facebook album. We then parse the data and push it to $scope.albumPhotos.
    $scope.albumClick = function(name, id) {
      $scope.loading = true;
      $scope.albumPhotos = [];
      //if there's no id on the thing we click, we know it's facebook wall photos
      if(!id){
        Facebook.getWallData().success(function(resp){
          var parse = JSON.parse(resp);
          for (var i = 0; i < parse.wallPhotos.picture.length;i++){
            $scope.loading = false;
            $scope.albumPhotos.push({
              src: parse.wallPhotos.picture[i],
              checked: false,
            });
          }
          console.log(resp);
        });
      }else{
        //if, on the other hand, we have the ids, we'll get the album data
        //based on the name album
        Facebook.getAlbumPhotos(name, id).success(function(resp) {
          var parse = JSON.parse(resp);
          console.log(parse);
            for (var i = parse[name].length - 1; i >= 0; i--) {
              $scope.loading = false;
              $scope.albumPhotos.push({
                src: parse[name][i],
                checked: false
              });
            }
          console.log('$scope.albumPhotos: ', $scope.albumPhotos);
        });
      }
    };

    $scope.snipClick = function(name) {
      $scope.snipPhotos = $scope.snips[name];
      $scope.newSnip = false;
      $scope.snipName = name;
      console.log('name', $scope.snipName);
    };

    $scope.checkOn = function(pic) {
      console.log('PICTURE', pic);
      $scope.snipPhotos.push(pic);
      pic.checked = true;
    };

    $scope.checkOff = function(pic) {
      console.log('PICTURE', pic);
      for (var i = 0; i < $scope.snipPhotos.length; i++) {
        if ($scope.snipPhotos[i].src === pic.src) {
          $scope.snipPhotos.splice(i, 1);
          break;
        }
      }

      pic.checked = false;
    };

    // This function is invoked on initialization of this controller. It fetches
    // the album names for the logged in Facebook user, which allows them to
    // select an album to fetch photos from.
    $scope.init = function() {

      Facebook.getAlbumData().success(function(resp) {
        var parse = JSON.parse(resp);
        for (var key in parse) {
          $scope.albumNames.push(parse[key]);
        }
        $scope.albumNames.push({name:'Facebook Wall Photos'});        
      });
      $scope.fetchUser();
      
    }();
<<<<<<< HEAD
=======

    var fixHeight = function(){
      document.getElementById('content').setAttribute('height',
        ($window.innerHeight - (document.getElementsByClassName('header')[0].offsetHeight))
      );
    };

    angular.element(document).ready(function () {
      fixHeight();
      window.addEventListener('resize', fixHeight, false);
    });
>>>>>>> minor changes to snip functionality
  }]);

'use strict';

angular.module('snippit.services', ['snippit'])
  .factory('ThreeFactory', function() {

    // This is a helper function that creates a CSS3D object
    // to be added to  a THREE.js. It takes an iteration count,
    // a collection of image sources, a THREE.js scene,
    // an array to save the object in, and a function to be called on each click.
    var createObject = function(i, collection, scene, objects, click) {
      var el = document.createElement('div');
      el.className = 'element';
      el.setAttribute('ng-show', 'picData[-1]');

      var image = document.createElement('img');
      image.className = 'picImg';
      image.src = collection[i];
      el.appendChild(image);


      var object = new THREE.CSS3DObject(el);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);

      if (click) {
        var bound = click.bind(i);
        el.addEventListener('click', bound);
      }

      objects.push(object);
    };

    // This is a helper function to create the position necessary for the table shape.
    // It takes a number denoting the columns, an iterator, and a target array to push the object positions into.
    var table = function(n, i, target) {
      var object = new THREE.Object3D();
      object.position.x = ((i % n) * 140) - 640;
      object.position.y = -((Math.floor(i / n) + 1) * 180) + 540;
      target.push(object);
    };

    // This is a helper function to create the position necessary for the sphere shape.
    // It takes an iterator, a vector to lookat, a target array to push the object positions into,
    // a radius, and the number of nodes to be in the sphere.
    var sphere = function(i, vector, target, r, n) {
      var phi = Math.acos(-1 + (2 * i) / n);
      var theta = Math.sqrt(n * Math.PI) * phi;

      var object = new THREE.Object3D();

      object.position.x = r * Math.cos(theta) * Math.sin(phi);
      object.position.y = r * Math.sin(theta) * Math.sin(phi);
      object.position.z = r * Math.cos(phi);

      vector.copy(object.position).multiplyScalar(2);

      object.lookAt(vector);

      target.push(object);
    };

    // This is a helper function to create the position necessary for the helix shapes.
    // It takes a number denoting the strings, an iterator, a vector to lookat,
    // a target array to push the object positions into, a spacing variable, the offset,
    // an X radius, a Z radius,and the step height.
    var helix = function(n, i, vector, target, spacing, offset, xRad, zRad, step) {
      var object = new THREE.Object3D();
      var phi = i * spacing + (i % n) / n * (Math.PI * 2);

      object.position.x = xRad * Math.sin(phi);
      object.position.y = -(i * step) + offset;
      object.position.z = zRad * Math.cos(phi);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);
      target.push(object);
    };

    // This is a helper function to create the position necessary for the grid shapes.
    // It takes a number denoting the columns and rows, an iterator,
    // and a target array to push the object positions into.
    var grid = function(n, i, target) {
      var object = new THREE.Object3D();

      object.position.x = ((i % n) * 400) - 800;
      object.position.y = (-(Math.floor(i / n) % n) * 400) + 800;
      object.position.z = (Math.floor(i / (n * n))) * 800;

      target.push(object);
    };

    return {
      createObject: createObject,
      table: table,
      sphere: sphere,
      helix: helix,
      grid: grid
    };
  })
  .factory('Facebook', ['$http', function($http) {

    // This is a helper function to get the Wall Photos of the current user.
    var getWallData = function() {
      return $http.get('/getData');
    };

    var refreshWallData = function() {
      return $http.get('/getFacebookWall');
    };

    // This is a helper function to get an Album List of the current user.
    var getAlbumData = function() {
      return $http.get('/getFacebookAlbums');
    };

    // This is a helper function to get the Album Photos of the current user,
    // it takes an Album Name and Album ID.
    var getAlbumPhotos = function(name, id) {
      var obj = {name: name, id: id};
      return $http.post('/getFacebookAlbumPhotos', obj);
    };

    // Makes a get request and fetches Facebook user's name and ID.
    var getFacebookUser = function() {
      return $http.get('/facebookUser');
    };

    return {
      getWallData: getWallData,
      getAlbumData: getAlbumData,
      getAlbumPhotos: getAlbumPhotos,
      getFacebookUser: getFacebookUser,
      refreshWallData: refreshWallData
    };
  }])
;


'use strict';

angular.module('snippit.three', ['snippit'])
  .controller('ThreeController', ['$scope', 'ThreeFactory', '$window', '$document', 'Facebook', function($scope, ThreeFactory, $window, $document, Facebook) {

    // These instantiate the THREE.js scene, renderer, camera, controls, and data.
    var scene, renderer, camera, controls;

    //Setup is a boolean that lets us know not to render the scene until we have
    //the facebook data.
    var setup = false;

    // This is a helper function that returns the total height of the THREE.js scene.
    var sceneHeight = function(){
      return $window.innerHeight - (document.getElementsByClassName('header')[0].offsetHeight);
    };

    $scope.objects = [];
    $scope.targets = {table: [], sphere: [], helix: [], doubleHelix: [], tripleHelix: [], grid: []};

    var threeJS = function(resp) {
      var dat = JSON.parse(resp.data);

      var data = {pictures: dat.wallPhotos.picture,
                 thumbnails: dat.wallPhotos.thumbnail
                };

      camera = new THREE.PerspectiveCamera(30, $window.innerWidth / sceneHeight(), 1, 10000);
      camera.position.z = 1500;
      scene = new THREE.Scene();

      setup = true;

      var vector = new THREE.Vector3();

      var len = data.thumbnails.length;

      for (var i = 0; i < len; i++) {
        ThreeFactory.createObject(i, data.thumbnails, scene, $scope.objects, $scope.hit);
        ThreeFactory.table(10, i, $scope.targets.table);
        ThreeFactory.sphere(i, vector, $scope.targets.sphere, 800, len);
        ThreeFactory.helix(1, i, vector, $scope.targets.helix, 0.175, 450, 900, 900, 8);
        ThreeFactory.helix(2, i, vector, $scope.targets.doubleHelix, 0.175, 450, 500, 500, 50);
        ThreeFactory.helix(3, i, vector, $scope.targets.tripleHelix, 0.1, 450, 500, 500, 50);
        ThreeFactory.grid(5, i, $scope.targets.grid);
      }

      renderer = new THREE.CSS3DRenderer();
      renderer.setSize($window.innerWidth, sceneHeight());
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.classList.add('render');

      $scope.transform($scope.targets.table, 2000);

      document.getElementById('content').setAttribute('height', sceneHeight());
      document.getElementById('container').appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize, false);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.damping = 0.2;
      controls.addEventListener('change', $scope.render);
    };

    // Now checks to see if photos currently exist in the database for
    // this user. If not, it'll fetch them from Facebook, if it does, it'll
    // fetch from MongoDB.
    var init = function(){
      Facebook.getWallData()
        .then(function(resp){
        if (resp.data.bool === 'false') {
          Facebook.refreshWallData()
          .then(function(resp) {
            threeJS(resp);
          });
        } else {
          threeJS(resp);
        }
      });
    };

    $scope.hit = function(){
      Modal.open({
         content: "<div class='imageResize'><img src='"+data.pictures[this]+"' /></div>",
         draggable: false,
         width: 'auto',
         context: this
       });
    };

    $scope.clicked = function(targets){
      $scope.transform(targets, 2000);

      new TWEEN.Tween(camera.position)
        .to({x: 0, y: 0, z: 3000}, 2000)
        .start();

      new TWEEN.Tween(camera.rotation)
        .to({_x: -0, _y: 0, _z: -0}, 2000)
        .start();

      new TWEEN.Tween(controls.center)
        .to({x: 0, y: 0, z: 0}, 2000)
        .start();
    };

    $scope.transform = function(targets, duration) {

      TWEEN.removeAll();

      for (var i = 0; i < $scope.objects.length; i++) {
        var object = $scope.objects[i];
        var target = targets[i];

        new TWEEN.Tween(object.position)
          .to({x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(object.rotation)
          .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }

      new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate($scope.render)
        .start();
    };

    var onWindowResize = function() {

      camera.aspect = window.innerWidth / sceneHeight();
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, sceneHeight());

      $scope.render();
    };

    var animate = function() {
      requestAnimationFrame(animate);
      if (setup) {
        TWEEN.update();
        controls.update();
      }
    };

    angular.element(document).ready(function () {
      init();
      animate();
    });

    $scope.render = function(){
      renderer.render(scene, camera);
    };
  }]);
