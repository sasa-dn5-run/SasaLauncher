import { MainApp } from '../main'
import { AccountApiInitializer } from './initializer/AccountApiInitializer'
import { ConfigurationApiInitializer } from './initializer/ConfigurationApiInitializer'
import { CoreApiInitializer } from './initializer/CoreApiInitializer'
import { DistributionApiInitializer } from './initializer/DistributionApiInitializer'
import { MinecraftApiInitializer } from './initializer/MinecraftApiInitializer'
import { NativeApiInitializer } from './initializer/NativeApiInitializer'
import { WindowApiInitializer } from './initializer/WindowApiInitializer'

export class API {
    constructor(app: MainApp) {
        new CoreApiInitializer(app)
        new WindowApiInitializer(app)
        new NativeApiInitializer(app)
        new DistributionApiInitializer(app)
        new ConfigurationApiInitializer(app)
        new AccountApiInitializer(app)
        new MinecraftApiInitializer(app)
    }
}
