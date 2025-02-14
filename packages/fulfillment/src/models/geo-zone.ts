import {
  createPsqlIndexStatementHelper,
  DALUtils,
  generateEntityId,
  GeoZoneType,
} from "@medusajs/utils"

import {
  BeforeCreate,
  Entity,
  Enum,
  Filter,
  Index,
  ManyToOne,
  OnInit,
  OptionalProps,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"
import { DAL } from "@medusajs/types"
import ServiceZone from "./service-zone"

type GeoZoneOptionalProps = DAL.SoftDeletableEntityDateColumns

const deletedAtIndexName = "IDX_geo_zone_deleted_at"
const deletedAtIndexStatement = createPsqlIndexStatementHelper({
  name: deletedAtIndexName,
  tableName: "geo_zone",
  columns: "deleted_at",
  where: "deleted_at IS NOT NULL",
})

const countryCodeIndexName = "IDX_geo_zone_country_code"
const countryCodeIndexStatement = createPsqlIndexStatementHelper({
  name: countryCodeIndexName,
  tableName: "geo_zone",
  columns: "country_code",
  where: "deleted_at IS NULL",
})

const provinceCodeIndexName = "IDX_geo_zone_province_code"
const provinceCodeIndexStatement = createPsqlIndexStatementHelper({
  name: provinceCodeIndexName,
  tableName: "geo_zone",
  columns: "province_code",
  where: "deleted_at IS NULL AND province_code IS NOT NULL",
})

const cityIndexName = "IDX_geo_zone_city"
const cityIndexStatement = createPsqlIndexStatementHelper({
  name: cityIndexName,
  tableName: "geo_zone",
  columns: "city",
  where: "deleted_at IS NULL AND city IS NOT NULL",
})

const serviceZoneIdIndexName = "IDX_geo_zone_service_zone_id"
const serviceZoneIdStatement = createPsqlIndexStatementHelper({
  name: serviceZoneIdIndexName,
  tableName: "geo_zone",
  columns: "service_zone_id",
  where: "deleted_at IS NULL",
})

@Entity()
@Filter(DALUtils.mikroOrmSoftDeletableFilterOptions)
export default class GeoZone {
  [OptionalProps]?: GeoZoneOptionalProps

  @PrimaryKey({ columnType: "text" })
  id: string

  @Enum({ items: () => GeoZoneType, default: GeoZoneType.COUNTRY })
  type: GeoZoneType

  @Index({
    name: countryCodeIndexName,
    expression: countryCodeIndexStatement,
  })
  @Property({ columnType: "text" })
  country_code: string

  @Index({
    name: provinceCodeIndexName,
    expression: provinceCodeIndexStatement,
  })
  @Property({ columnType: "text", nullable: true })
  province_code: string | null = null

  @Index({
    name: cityIndexName,
    expression: cityIndexStatement,
  })
  @Property({ columnType: "text", nullable: true })
  city: string | null = null

  @Property({ columnType: "text" })
  @Index({
    name: serviceZoneIdIndexName,
    expression: serviceZoneIdStatement,
  })
  service_zone_id: string

  // TODO: Do we have an example or idea of what would be stored in this field? like lat/long for example?
  @Property({ columnType: "jsonb", nullable: true })
  postal_expression: Record<string, unknown> | null = null

  @Property({ columnType: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null = null

  @ManyToOne(() => ServiceZone, {
    persist: false,
  })
  service_zone: ServiceZone

  @Property({
    onCreate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  created_at: Date

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  updated_at: Date

  @Index({
    name: deletedAtIndexName,
    expression: deletedAtIndexStatement,
  })
  @Property({ columnType: "timestamptz", nullable: true })
  deleted_at: Date | null = null

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, " fgz")
    this.service_zone_id ??= this.service_zone?.id
  }

  @OnInit()
  onInit() {
    this.id = generateEntityId(this.id, "fgz")
    this.service_zone_id ??= this.service_zone?.id
  }
}
